import {
  IModify,
  IPersistence,
  IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import { TextObjectType } from "@rocket.chat/apps-engine/definition/uikit";
import { IUIKitModalViewParam } from "@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder";
import { WelcomePersistence } from "../persistence/WelcomePersistence";

export async function configModal(
  read: IRead,
  modify: IModify,
  room: IRoom
): Promise<IUIKitModalViewParam> {
  const blockBuilder = modify.getCreator().getBlockBuilder();
  const records = await WelcomePersistence.get_room_config(read, room.id);
  console.log("ROOM RECORDS: ", records);
  // we have records,
  if (records.length) {
    var enabled = records[0]["config"]["enabled"] as string;
    var notification_text = records[0]["config"]["notification_text"] as string;
    var message_text = records[0]["config"]["message_text"] as string;
    var direct_text = records[0]["config"]["direct_text"] as string;
    var direct_emulate_text = records[0]["config"]["direct_emulate_text"] as string;
  } else {
    var enabled = "true";
    var notification_text = "";
    var message_text = "";
    var direct_text = "";
    var direct_emulate_text = "";
  }
  //const notification_text = records[0]["config"]["enabled"]
  blockBuilder.addSectionBlock({
    text: blockBuilder.newMarkdownTextObject(
      `*Channel #${room.slugifiedName}*`
    ),
  });
  // select enabled or disabled
  blockBuilder.addInputBlock({
    blockId: "welcome-config",
    optional: true,
    element: blockBuilder.newStaticSelectElement({
      placeholder: blockBuilder.newPlainTextObject("Enabled or Disabled?"),
      actionId: "enabled",
      initialValue: enabled,
      options: [
        {
          text: blockBuilder.newPlainTextObject("Enabled"),
          value: "true",
        },
        {
          text: blockBuilder.newPlainTextObject("Disabled"),
          value: "false",
        },
      ],
    }),
    label: blockBuilder.newPlainTextObject("Status"),
  });
  // notification config
  blockBuilder.addInputBlock({
    blockId: "welcome-config",
    label: {
      text: "Text to notify joining users (only shows to user)",
      type: TextObjectType.PLAINTEXT,
    },
    element: blockBuilder.newPlainTextInputElement({
      actionId: "notification_text",
      initialValue: notification_text,
      multiline: true
    }),
  });
  // message config
  blockBuilder.addInputBlock({
    blockId: "welcome-config",
    label: {
      text: `Text to send to #${room.slugifiedName} when a user joins`,
      type: TextObjectType.PLAINTEXT,
    },
    element: blockBuilder.newPlainTextInputElement({
      actionId: "message_text",
      initialValue: message_text,
      multiline: true
    }),
  });
  // direct config
  blockBuilder.addInputBlock({
    blockId: "welcome-config",
    label: {
      text: "Text to send by direct to joining users",
      type: TextObjectType.PLAINTEXT,
    },
    element: blockBuilder.newPlainTextInputElement({
      actionId: "direct_text",
      initialValue: direct_text,
      multiline: true
    }),
  });
  // direct emulate config
  blockBuilder.addInputBlock({
    blockId: "welcome-config",
    label: {
      text: "Text to emulate the user sending to the bot \n(so it triggers the bot)",
      type: TextObjectType.MARKDOWN,
    },
    element: blockBuilder.newPlainTextInputElement({
      actionId: "direct_emulate_text",
      initialValue: direct_emulate_text,
      multiline: true
    }),
  });
  return {
    title: blockBuilder.newMarkdownTextObject("Welcome Bot Configuration"),
    submit: blockBuilder.newButtonElement({
      actionId: "welcome-config-room#" + room.id,
      text: {
        type: TextObjectType.PLAINTEXT,
        text: "Save"
      },
    }),
    blocks: blockBuilder.getBlocks(),
  };
}
