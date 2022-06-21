import UpdateService from './UpdateService';
import ChannelService from './ChannelService';
import AppService from './AppService';
import AuthService from './AuthService'
import PermissionService from './PermissionService'
import UserService from './UserService'
import GroupService from './GroupService'
import StorageService from './StorageService'
import AliOSSUpdateService from './AliOSSUpdateService'

export function useAllServices() {
  return {
    AuthService,
    PermissionService,
    UserService,
    GroupService,
    AppService,
    ChannelService,
    UpdateService,
    StorageService,
    AliOSSUpdateService,
  }
}