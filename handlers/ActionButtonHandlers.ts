import {
  IHttp,
  ILogger,
  IModify,
  IPersistence,
  IPersistenceRead,
  IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
  IUIKitResponse,
  TextObjectType,
  UIKitActionButtonInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { WelcomePersistence } from "../persistence/WelcomePersistence";
import { configModal } from "../ui/ChannelConfigModal";

export class ActionButtonHandler {
  public async executor(
    context: UIKitActionButtonInteractionContext,
    read: IRead,
    http: IHttp,
    persistence: IPersistence,
    modify: IModify,
    logger: ILogger
  ): Promise<IUIKitResponse> {
    const { actionId, room } = context.getInteractionData();
    // If you have multiple action buttons, use `actionId` to determine
    // which one the user interacted with
    if (actionId === "welcome-config-room") {
      // TODO: check permissions here
      // const owners = await read.getRoomReader().getOwners(room.id)
      // console.log("THIS ROOM OWNERS ", owners)
      console.log(context);
      // get config modal
      const modal = await configModal(read, modify, room);
      return context.getInteractionResponder().openModalViewResponse(modal);
    }

    return context.getInteractionResponder().successResponse();
  }
}
