import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import * as actions from '../actions';
import * as selectors from '../selectors';
import { NetworkError } from '../../../backend';

function AlertNetworkError () {

    const error = useSelector(selectors.getError);
    const dispatch = useDispatch();

    useEffect(() => {

        if (error == null) return;

        const message = error instanceof NetworkError ?
            "Error de red. Intentelo mas tarde." :
            error.message;
        alert(message);
        dispatch(actions.error(null));

    }, [dispatch, error])

    return null;
}

export default AlertNetworkError;