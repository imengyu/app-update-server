import StorageMapping from './StorageMapping';
import GroupMapping from './GroupMapping'
import OnceAuthMapping from './OnceAuthMapping'
import UserMapping from './UserMapping'

export function useAllMappings() {
  return {
    GroupMapping,
    UserMapping,
    OnceAuthMapping,
    StorageMapping,
  }
}