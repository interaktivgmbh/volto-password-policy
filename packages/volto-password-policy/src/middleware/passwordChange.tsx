import { push } from 'connected-react-router';
import { createIntl, defineMessages } from 'react-intl';
import { toast } from 'react-toastify';
import { resetLoginRequest } from '@plone/volto/actions/userSession/userSession';
import Toast from '@plone/volto/components/manage/Toast/Toast';
import { LOGIN } from '@plone/volto/constants/ActionTypes';

// error type of the @login service of interaktiv.passwordpolicy
const PASSWORD_CHANGE_REQUIRED = 'Password change required';

const messages = defineMessages({
  title: {
    id: 'Please update your password',
    defaultMessage: 'Please update your password',
  },
});

// tells the backend that we handle the reset token of users without email
export const markLogin = () => (next) => (action) => {
  if (action.type !== LOGIN) {
    return next(action);
  }

  return next({
    ...action,
    request: {
      ...action.request,
      headers: {
        ...action.request.headers,
        'X-Password-Change': 'reset-token',
      },
    },
  });
};

export const passwordChange =
  ({ dispatch, getState }) =>
  (next) =>
  (action) => {
    const error = action.error?.response?.body?.error;

    if (
      action.type !== `${LOGIN}_FAIL` ||
      error?.type !== PASSWORD_CHANGE_REQUIRED
    ) {
      return next(action);
    }

    // instead of the failed login, so the login form shows no "Login failed"
    next(resetLoginRequest());

    // only for users who cannot receive the reset email
    if (error.reset_token) {
      dispatch(push(`/passwordreset/${error.reset_token}`));
    }

    const intl = createIntl(getState().intl);

    toast.warning(
      <Toast
        warning
        title={intl.formatMessage(messages.title)}
        content={error.message}
      />,
      {
        autoClose: false,
        toastId: 'passwordChangeRequired',
      },
    );

    return action;
  };
