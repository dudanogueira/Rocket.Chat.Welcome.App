import { IPersistence, IPersistenceRead, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IMessageReportContext } from '@rocket.chat/apps-engine/definition/messages';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { IRoom, IRoomUserJoinedContext } from '@rocket.chat/apps-engine/definition/rooms';

export interface IWelcomeConfig {
    /**
     * if this config is active or not
     */
    enabled: boolean;
    /**
     * text to send as notification
     */
    notification_text?: string;
    /**
     * Text to send at the channel
     */
    message_text?: string;
    /**
     * Direct to send at the channel
     */
    direct_text?: string;
    /**
     * Text to emulate the joined user sending to the bot, in order to trigger a bot
     */
    direct_emulate_text?: string;
}

export class WelcomePersistence {
    // add a record
    public static async update_welcome_config(persist: IPersistence, room_id: string, config:any): Promise<boolean> {

        const associations: Array<RocketChatAssociationRecord> = [
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'welcome_config'),
            new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, room_id),
        ];

        try {
            await persist.updateByAssociations(associations, { config }, true);
        } catch (err) {
            console.warn(err);
            return false;
        }
        return true;
    }

    public static async get_room_config(read: IRead, room_id:string): Promise<any>{
        
        const associations: Array<RocketChatAssociationRecord> = [
            new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'welcome_config'),
            new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, room_id),
        ];


        const records: any = (await read.getPersistenceReader().readByAssociations(associations));
        return records
    }

    

}