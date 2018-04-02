import { LOCATION_CHANGE } from 'react-router-redux';
import { ROLES_LOADED } from '../actions/roles';
import {
  SET_MESSAGE,
  CLEAR_MESSAGE,
  MENU_LOADED,
  MENU_FILTERED,
} from '../actions/application';

export const initialState = {
  message: null,
  menuLinks: [],
  filteredMenuLinks: [],
  filterString: '',
};

const filterMenuLinks = (string, menuLinks) => {
  return menuLinks
    .map(menuLink => {
      const subtree =
        menuLink.subtree && filterMenuLinks(string, menuLink.subtree);
      if (
        (menuLink.link &&
          `${menuLink.link.title}${menuLink.link.description}`
            .toLowerCase()
            .indexOf(string.toLowerCase()) !== -1) ||
        (Array.isArray(subtree) && subtree.length > 0)
      ) {
        return {
          ...menuLink,
          subtree,
        };
      }
      return null;
    })
    .filter(id => id);
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_MESSAGE: {
      return {
        ...state,
        message: {
          message: action.payload.message,
          type: action.payload.type,
        },
      };
    }
    case CLEAR_MESSAGE: {
      return {
        ...state,
        message: null,
      };
    }
    case LOCATION_CHANGE: {
      // Clear messages on every location change.
      return {
        ...state,
        message: null,
      };
    }
    case MENU_LOADED: {
      const menuLinks = action.payload.menuLinks.map(menuLink => {
        // Explicitly add the Permissions and Roles as top level menu items, as
        // those are usually local tasks which are not supported at the moment.
        if (menuLink.link.url.indexOf('admin/people') !== -1) {
          menuLink.subtree.push({
            subtree: [],
            hasChildren: false,
            inActiveTrail: false,
            link: {
              weight: '4',
              title: '🔐 Permissions',
              description: 'Manage permissions.',
              menuName: 'admin',
              url: '/admin/people/permissions',
            },
          });
          menuLink.subtree.push({
            subtree: [],
            hasChildren: false,
            inActiveTrail: false,
            link: {
              weight: '5',
              title: '📇 Roles',
              description: 'Manage roles.',
              menuName: 'admin',
              url: '/admin/people/roles',
            },
          });
        }
        return menuLink;
      });
      return {
        ...state,
        menuLinks,
      };
    }
    case MENU_FILTERED:
      if (action.payload.string) {
        return {
          ...state,
          filterString: action.payload.string,
          filteredMenuLinks: filterMenuLinks(
            action.payload.string,
            state.menuLinks,
          ),
        };
      }
      return {
        ...state,
        filterString: action.payload.string,
      };
    case ROLES_LOADED: {
      const roles = action.payload.roles.data;
      return {
        ...state,
        roles,
      };
    }
    default: {
      return { ...state };
    }
  }
};
