import {
  ISetting,
  SettingType,
} from "@rocket.chat/apps-engine/definition/settings";

export enum AppSetting {
  OwnerCanConfig = "welcome_owner_can_config",
  ModeratorCanConfig = "welcome_moderator_can_config",
  GlobalConfigUsers = "welcome_global_admins",
}

export const settings: Array<ISetting> = [
  {
    id: AppSetting.OwnerCanConfig,
    public: true,
    type: SettingType.BOOLEAN,
    value: true,
    packageValue: "true",
    hidden: false,
    i18nLabel: "Welcome_OwnerCanConfig_Label",
    i18nDescription: "Welcome_OwnerCanConfig_Desc",
    required: false,
  },
  {
    id: AppSetting.ModeratorCanConfig,
    public: true,
    type: SettingType.BOOLEAN,
    value: true,
    packageValue: "true",
    hidden: false,
    i18nLabel: "Welcome_ModeratorCanConfig_Label",
    i18nDescription: "Welcome_ModeratorCanConfig_Desc",
    required: false,
  },
  {
    id: AppSetting.GlobalConfigUsers,
    public: true,
    type: SettingType.STRING,
    value: "",
    packageValue: "",
    hidden: false,
    i18nLabel: "Welcome_GlobalConfigUsers_Label",
    i18nDescription: "Welcome_GlobalConfigUsers_Desc",
    required: true,
  },
];
