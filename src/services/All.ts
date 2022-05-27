import UpdateService from './UpdateService';
import ChannelService from './ChannelService';
import AppService from './AppService';
import AuthService from './AuthService'
import PermissionService from './PermissionService'
import UserService from './UserService'
import GroupService from './GroupService'

export function useAllServices() {
  return {
    AuthService,
    PermissionService,
    UserService,
    GroupService,
    AppService,
    ChannelService,
    UpdateService,
  }
}