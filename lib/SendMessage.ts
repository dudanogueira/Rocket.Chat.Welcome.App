import { IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

export async function sendMessage(
    modify: IModify,
    room: IRoom,
    message: string,
    sender?: IUser,
): Promise<string> {

    const msg = modify.getCreator().startMessage()
        .setRoom(room)
        .setText(message);

    if(sender){
        msg.setSender(sender)
    }

    return await modify.getCreator().finish(msg);
}