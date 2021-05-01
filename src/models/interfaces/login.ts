import {User} from '@/models/interfaces/user';
import {Session} from '@/models/interfaces/session';

export interface LoginResponse {
  user: User;
  session: Session;
  isNewUser: boolean;
  intercomHash: string;
}
