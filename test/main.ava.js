import { Worker, NEAR } from "near-workspaces";
import test from "ava";

test.beforeEach(async (t) => {
  const worker = await Worker.init();

  const root = worker.rootAccount;

  const gb = await root.devDeploy("./test/contracts/hello_near.wasm"); // set_greeting & get_greeting methods
  const contract = await root.createSubAccount("contract");
  await contract.deploy("./build/contract.wasm");

  const alice = await root.createSubAccount("alice", { initialBalance: NEAR.parse("10 N").toJSON() });

  t.context.worker = worker;
  t.context.accounts = { root, contract, alice, gb };
});

test.afterEach.always(async (t) => {
  await t.context.worker.tearDown().catch((error) => {
    console.log("Failed to tear down the worker:", error);
  });
});

test("xcc_call_method with set_message", async (t) => {
  const { contract, root, gb } = t.context.accounts;
  const gas = "300000000000000"; // 300 Tgas
  await root.call(contract, "xcc_call_method", { target_contract_account_id: gb.accountId, function_name: "set_greeting" }, { gas: gas });
  const result = await gb.view("get_greeting");
  t.deepEqual(result, "hello from the other side");
});

test("xcc_call_method with get_message", async (t) => {
  const { contract, root, gb } = t.context.accounts;
  const gas = "300000000000000"; // 300 Tgas
  const result = await root.call(contract, "xcc_call_method", { target_contract_account_id: gb.accountId, function_name: "get_greeting" }, { gas: gas });
  t.deepEqual(result, "Hello");
});

test("xcc_view_method with set_message", async (t) => {
  const { contract, gb } = t.context.accounts;
  const gas = "300000000000000"; // 300 Tgas
  try {
    const result = await contract.view("xcc_view_method", { target_contract_account_id: gb.accountId, function_name: "set_greeting" }, { gas: gas });
    t.deepEqual(result, "hello from the other side");
  } catch (error) {
    // we can not call set_greeting in xcc with view method
    const message = `Querying [object Object] failed: wasm execution failed with error: FunctionCallError(HostError(ProhibitedInView { method_name: "promise_batch_create" })).`;
    t.true(error.message.includes(message));
  }
});

test("xcc_view_method with get_message", async (t) => {
  const { contract, gb } = t.context.accounts;
  const gas = "300000000000000"; // 300 Tgas
  try {
    const result = await contract.view("xcc_view_method", { target_contract_account_id: gb.accountId, function_name: "get_greeting" }, { gas: gas });
    t.deepEqual(result, "Hello");
  } catch (error) {
    // we can not call get_greeting in xcc with view method, as it is a promise function call
    const message = `Querying [object Object] failed: wasm execution failed with error: FunctionCallError(HostError(ProhibitedInView { method_name: "promise_batch_create" })).`;
    t.true(error.message.includes(message));
  }
});
