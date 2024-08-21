const userUrl = `${import.meta.env.VITE_REACT_APP_BACKEND_URL}`;

const UserApi = {
  createUser: {
    url: `/api/users/create`,

  },
  userLogin: {
    url: `/api/users/login`,
  },
  userDetails: {
    url: `/api/users/user-details`,
  },
  userUpdate: {
    url: `/api/users/user-update`,
  },

  userSearch: {
    url: `/api/users/search-user`,
  },
};

export default UserApi;
