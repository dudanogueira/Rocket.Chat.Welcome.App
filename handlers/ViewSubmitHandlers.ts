import {
  IHttp,
  ILogger,
  IModify,
  IPersistence,
  IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { UIKitViewSubmitInteractionContext } from "@rocket.chat/apps-engine/definition/uikit";
import { sendNotification } from "../lib/SendNotification";
import { WelcomePersistence } from "../persistence/WelcomePersistence";

export class ViewSubmitHandler {
  public async executor(
    context: UIKitViewSubmitInteractionContext,
    read: IRead,
    http: IHttp,
    persistence: IPersistence,
    modify: IModify,
    logger?: ILogger
  ) {
    const data = context.getInteractionData();
    const state = data.view.state;
    if (data.view.submit?.actionId.startsWith("welcome-config-room")) {
      // little hack to get room id
      let room_id = data.view.submit?.actionId.split("#")[1];
      if (state) {
        const config = state["welcome-config"];
        const update = await WelcomePersistence.update_welcome_config(
          persistence,
          room_id,
          config
        );
        const room = await read.getRoomReader().getById(room_id);
        if (update && room) {
          let feedback_message =
            "Welcome Bot settings were changed for this channel";
          await sendNotification(modify, room, data.user, feedback_message);
          return {success: true}
        }
      }
    }
    return {
      success: true,
    };
  }
}
