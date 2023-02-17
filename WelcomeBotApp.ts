import {
  IAppAccessors,
  IConfigurationExtend,
  IEnvironmentRead,
  IHttp,
  ILogger,
  IModify,
  IPersistence,
  IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import {
  IPostRoomUserJoined,
  IRoom,
  IRoomUserJoinedContext,
  RoomType,
} from "@rocket.chat/apps-engine/definition/rooms";
import {
  IUIKitResponse,
  UIKitActionButtonInteractionContext,
  UIKitViewSubmitInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { buttons } from "./config/Buttons";
import { ActionButtonHandler } from "./handlers/ActionButtonHandlers";
import { ViewSubmitHandler } from "./handlers/ViewSubmitHandlers";
import { sendMessage } from "./lib/SendMessage";
import { sendNotification } from "./lib/SendNotification";
import { WelcomePersistence } from "./persistence/WelcomePersistence";


export class WelcomeBotApp extends App implements IPostRoomUserJoined {
  constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
    super(info, logger, accessors);
  }

  public async executePostRoomUserJoined(
    context: IRoomUserJoinedContext,
    read: IRead,
    http: IHttp,
    persistence: IPersistence,
    modify: IModify
  ): Promise<void> {
    // get welcome settings for this channel
    const channel_config = await WelcomePersistence.get_room_config(
      read,
      context.room.id
    );
    // get context vars for the messages
    var vars = {}
    vars["{{user.username}}"] = context.joiningUser.username
    vars["{{room.slugifiedName}}"] = context.room.slugifiedName
    // NOTIFICATION
    var template = channel_config[0]["config"]["notification_text"];
    if (template) {
      // render text
      var notification_text = this.replaceAll(template, vars)
      await sendNotification(
        modify,
        context.room,
        context.joiningUser,
        notification_text
      );
    }
    // MESSAGE
    var template = channel_config[0]["config"]["message_text"];
    if (template) {
      var message_text = this.replaceAll(template, vars)
      await sendMessage(modify, context.room, message_text);
    }
    // DIRECT
    var template = channel_config[0]["config"]["direct_text"];
    if (template) {
      const direct_text = this.replaceAll(template, vars)
      await this.sendDirect(context, read, modify, direct_text, false);
    }
    // EMULATE
    var template = channel_config[0]["config"]["direct_emulate_text"];
    if (template) {
      const direct_emulate_text = this.replaceAll(template, vars)
      await this.sendDirect(context, read, modify, direct_emulate_text, true);
    }
  }

  public async extendConfiguration(
    configuration: IConfigurationExtend
  ): Promise<void> {
    // room action menu
    await Promise.all(
      buttons.map((button) => configuration.ui.registerButton(button))
    );
  }

  public async executeActionButtonHandler(
    context: UIKitActionButtonInteractionContext,
    read: IRead,
    http: IHttp,
    persistence: IPersistence,
    modify: IModify
  ): Promise<IUIKitResponse> {
    // lets just move this execution to another file to keep DemoApp.ts clean.
    return new ActionButtonHandler().executor(
      context,
      read,
      http,
      persistence,
      modify,
      this.getLogger()
    );
  }

  public async executeViewSubmitHandler(
    context: UIKitViewSubmitInteractionContext,
    read: IRead,
    http: IHttp,
    persistence: IPersistence,
    modify: IModify
  ) {
    // same for View SubmitHandler, moving to another Class
    return new ViewSubmitHandler().executor(
      context,
      read,
      http,
      persistence,
      modify,
      this.getLogger()
    );
  }

  // HELPERS

  private async getOrCreateDirectRoom(
    read: IRead,
    modify: IModify,
    usernames: Array<string>,
    creator?: IUser
  ) {
    let room;
    // first, let's try to get the direct room for given usernames
    try {
      room = await read.getRoomReader().getDirectByUsernames(usernames);
    } catch (error) {
      this.getLogger().log(error);
      return;
    }
    // nice, room exist already, lets return it.
    if (room) {
      return room;
    } else {
      // no room for the given users. Lets create a room now!
      // for flexibility, we might allow different creators
      // if no creator, use app user bot
      if (!creator) {
        creator = await read.getUserReader().getAppUser();
        if (!creator) {
          throw new Error("Error while getting AppUser");
        }
      }

      let roomId: string;
      // Create direct room
      const newRoom = modify
        .getCreator()
        .startRoom()
        .setType(RoomType.DIRECT_MESSAGE)
        .setCreator(creator)
        .setMembersToBeAddedByUsernames(usernames);
      roomId = await modify.getCreator().finish(newRoom);
      return await read.getRoomReader().getById(roomId);
    }
  }

  private async sendDirect(
    context: IRoomUserJoinedContext,
    read: IRead,
    modify: IModify,
    message: string,
    emulate_sender: boolean
  ): Promise<void> {
    const messageStructure = modify.getCreator().startMessage();
    const sender = context.joiningUser; // get the sender from context
    // this will output the message as the joined user
    // useful for bot triggering
    if (emulate_sender) {
      messageStructure.setSender(sender);
    }
    // get the appUser username
    const appUser = await read.getUserReader().getAppUser();
    if (!appUser) {
      throw new Error("Something went wrong getting App User!");
    }
    // lets use a function we created to get or create direct room
    let room = (await this.getOrCreateDirectRoom(read, modify, [
      sender.username,
      appUser.username,
    ])) as IRoom;
    messageStructure.setRoom(room).setText(message); // set the text message
    await modify.getCreator().finish(messageStructure); // sends the message in the room.
  }

  private replaceAll(str, vars: any) {

    for (const [key, value] of Object.entries(vars)) {
      str = str.replace(new RegExp(key, 'g'), value);
    }

    return str
  }
}
