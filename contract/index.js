import { NearBindgen, call, view, near, NearPromise } from "near-sdk-js";

const GET_GREETING_FNAME = "get_greeting";

@NearBindgen({ initRequired: true })
export class FungibleToken {
  @call({ privateFunction: true })
  internalCallbackMethod() {
    try {
      const promiseResult = near.promiseResult(0);
      near.log("Passed callback");
      try {
        const promiseObject = JSON.parse(promiseResult);
        near.log(`Passed JSON parsing. promiseObject: ${promiseObject}`)
        return promiseObject;
      } catch (err) {
        const msg = `Failed JSON parse. Reason: ${err.message} stack: ${err.stack} promiseResult: ${promiseResult}`;
        near.log(msg);
        return;
      }
    } catch (err) {
      const message = `Failed callback. Reason: ${err.message} stack: ${err.stack}`;
      near.log(message);
      throw new Error(message);
    }
  }

  @call({ payableFunction: true })
  xcc_call_method({ target_contract_account_id, function_name }) {
    return this.internalXCCLogic(function_name, target_contract_account_id);
  }

  @view({})
  xcc_view_method({ target_contract_account_id, function_name }) {
    return this.internalXCCLogic(function_name, target_contract_account_id);
  }

  internalXCCLogic(function_name, target_contract_account_id) {
    const getGreetingFunctionName = GET_GREETING_FNAME;
    const isViewCall = function_name === getGreetingFunctionName;
    const args = isViewCall ? {} : { message: "hello from the other side" };
    const thirtyTgas = 30000000000000; // 30 Tgas
    const promise = NearPromise.new(target_contract_account_id)
      .functionCall(function_name, JSON.stringify(args), 0, thirtyTgas) // functionCalls always require gas attached
      .then(NearPromise.new(near.currentAccountId()).functionCall("internalCallbackMethod", JSON.stringify({}), 0, thirtyTgas)); // functionCalls always require gas attached
    return promise.asReturn();
  }
}
