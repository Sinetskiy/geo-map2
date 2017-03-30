export default {
    login(appId, perms) {
        return new Promise((resolve, reject) => {
            VK.init({
                apiId: appId
            });

            VK.Auth.login(response => {
                if (response.session) {
                    resolve(response);
                } else {
                    reject(new Error('Не удалось авторизоваться'));
                }
            }, perms);
        });
    },
    callApi(method, params = {}) {
        params = Object.assign({v: 5.63}, params);

        return new Promise((resolve, reject) => {
            VK.api(method, params, ({response, error}) => {
                if (error) {
                    reject(new Error(error.error_msg));
                } else {
                    resolve(response);
                }
            });
        });
    },
    getFriends(fields) {
        return this.callApi('friends.get', {fields});
    }
};
