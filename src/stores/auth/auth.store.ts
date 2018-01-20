import { action, computed, observable, runInAction } from 'mobx';
import { AsyncStorage } from 'react-native';
import request from '../../utils/request';
import userStore from '../user/user.store';

export class AuthStore {
    private TOKEN_NAME = 'id_token';

    @observable authChecked = false;
    @observable token: string;

    @action async checkAuth() {
        await this.getToken();
        runInAction(() => {
            this.authChecked = true;
        });
    }

    async getToken(): Promise<string> {
        const token = await AsyncStorage.getItem(this.TOKEN_NAME);

        if (token) {
            this.token = token;
            await userStore.initialize();
        }

        return token;
    }

    @action async logOut() {
        await AsyncStorage.removeItem(this.TOKEN_NAME);
        await userStore.removeUser();
    }

    @action async signIn(accessToken: string) {
        const response = await request.get(`/auth/facebook?access_token=${accessToken}`);
        if (!response || !response.data) throw new Error('Failed Authenticating');

        runInAction(() => {
            this.token = response.data.token;
        });

        await AsyncStorage.setItem(this.TOKEN_NAME, this.token);
        await userStore.setUser(response.data.user);
    }

    @computed get isLoggedIn(){
        return !!this.token;
    }
}

const authStore = new AuthStore();
export default authStore;