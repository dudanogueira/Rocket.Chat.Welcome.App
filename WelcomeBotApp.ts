import {
  IAppAccessors,
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
import { IUser } from "@rocket.chat/apps-engine/definition/users";

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
    console.log("USER JOINED ROOM CONTEXT", context);
    const message = "Welcome Message!";
    await this.sendDirect(context, read, modify, message, false);
    // emulate joined user direct
    await this.sendDirect(context, read, modify, "/start", true);
  
  }

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
    if (emulate_sender){
      messageStructure.setSender(sender)
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

  // private async sendDirect(
  //   context: IRoomUserJoinedContext,
  //   read: IRead,
  //   modify: IModify,
  //   message: string
  // ): Promise<void> {
  //   if (["GENERAL", "9eWKNFDGF4iCSStwN"].includes(context.room.id)){
  //       const messageStructure = modify.getCreator().startMessage();
  //   // TODO find a way to get app bot username
  //   var room = await read
  //     .getRoomReader()
  //     .getDirectByUsernames([context.joiningUser.username, "welcome-bot.bot"]);
  //   console.log("SENDING DIRECT!!!", room);
  //   if (!room) {
  //     //create room
  //     // TODO CREATE ROOM WHEN NO ROOM
  //     console.log("NO ROOM!!!");
  //   } else {
  //     console.log("ROOMFOUND!!!");
  //   }
  //   messageStructure.setRoom(room).setText(message); // set the text message

  //   await modify.getCreator().finish(messageStructure); // sends the message in the room.

  //   }

  // }
}
