import { IUIActionButtonDescriptor, RoomTypeFilter, UIActionButtonContext } from "@rocket.chat/apps-engine/definition/ui";

export const buttons: Array<IUIActionButtonDescriptor> = [
    {
        actionId: 'welcome-config-room',
        labelI18n: 'Welcome_ConfigRoomButton',
        context: UIActionButtonContext.ROOM_ACTION,
        when: {
            roomTypes: [
                RoomTypeFilter.PUBLIC_CHANNEL, 
                RoomTypeFilter.PRIVATE_CHANNEL,
                RoomTypeFilter.PUBLIC_TEAM,
                RoomTypeFilter.PRIVATE_TEAM,
                RoomTypeFilter.PUBLIC_DISCUSSION,
                RoomTypeFilter.PRIVATE_DISCUSSION,
            ],
            hasOneRole: ['admin', 'moderator', 'owner', 'leader']
        }

    },

]