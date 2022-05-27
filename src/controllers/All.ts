import AuthController from "./AuthCotroller";
import UserCotroller from "./UserCotroller";
import WebCotroller from "./WebCotroller";
import GroupCotroller from "./GroupCotroller";
import PermissionCotroller from "./PermissionCotroller";

export function useAllControllers() {
  return {
    AuthController,
    UserCotroller,
    WebCotroller,
    PermissionCotroller,
    GroupCotroller,
  }
}