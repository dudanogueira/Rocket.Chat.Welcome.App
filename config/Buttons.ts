import { IUIActionButtonDescriptor, RoomTypeFilter, UIActionButtonContext } from "@rocket.chat/apps-engine/definition/ui";

export const buttons: Array<IUIActionButtonDescriptor> = [
    {
        actionId: 'welcome-config-room', // this identifies your button in the interaction event
        labelI18n: 'Welcome_ConfigRoomButton', // key of the i18n string containing the name of the button
        context: UIActionButtonContext.ROOM_ACTION, // in what context the action button will be displayed in the UI
        // If you want to choose `when` the button should be displayed
        when: {
            roomTypes: [
                RoomTypeFilter.PUBLIC_CHANNEL, 
                RoomTypeFilter.PRIVATE_CHANNEL,
                RoomTypeFilter.PUBLIC_TEAM,
                RoomTypeFilter.PRIVATE_TEAM,
                RoomTypeFilter.PUBLIC_DISCUSSION,
                RoomTypeFilter.PRIVATE_DISCUSSION,
            ],
        }
    },

]