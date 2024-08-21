const userUrl = `${import.meta.env.VITE_REACT_APP_BACKEND_URL}`;

const UserApi = {
  createUser: {
    url: `/api/users/create`,

  },
  userLogin: {
    url: `${userUrl}api/users/login`,
  },
  userDetails: {
    url: `${userUrl}api/users/user-details`,
  },
  userUpdate: {
    url: `${userUrl}api/users/user-update`,
  },

  userSearch: {
    url: `${userUrl}api/users/search-user`,
  },
};

export default UserApi;
