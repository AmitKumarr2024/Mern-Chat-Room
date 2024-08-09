const userUrl = `${import.meta.env.VITE_REACT_APP_BACKEND_URL}`;

const UserApi = {
  createUser: {
    path: `${userUrl}api/users/create`,
    method: "post",
  },
};

export default UserApi;
