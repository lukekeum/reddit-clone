/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Container from 'typedi'

export default {
  async requestDidStart() {
    return {
      async willSendResponse(requestContext: any) {
        Container.reset(requestContext.context.requestId)
      },
    }
  },
}
