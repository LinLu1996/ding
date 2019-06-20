import { initialProjects } from '../../../services/fieldManage';
import { handleResponse } from '../../../utils/globalUtils';

export default {
  namespace: 'fieldManage',

  state: {
    projects: [],
    selectedProject: undefined,
  },

  effects: {
    * onStateChange({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload,
      });
    },
    * initialProjects({ payload }, { put, call, select }) {
      const selectedProject = yield select(state => state.fieldManage.selectedProject);
      const response = yield call(initialProjects);
      if (handleResponse(response)) {
        const defaultSelected = response.data.length > 0 ? response.data[0].id : undefined;
        yield put({
          type: 'updateProjects',
          payload: {
            projects: response.data,
            selectedProject: payload.reset ? defaultSelected : (selectedProject || defaultSelected),
          },
        });
      }
    },
    * initialProjects2(_, { put, call }) {
      const response = yield call(initialProjects);
      if (handleResponse(response)) {
        yield put({
          type: 'updateProjects',
          payload: {
            projects: response.data,
            selectedProject: (response.data.length > 0 ? response.data[0].id : undefined),
          },
        });
      }
    },
    * onProjectSelected({ payload }, { put }) {
      yield put({
        type: 'updateSelectedProject',
        payload,
      });
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateProjects(state, { payload }) {
      return {
        ...state,
        projects: payload.projects.map(item => ({ ...item })),
        selectedProject: payload.selectedProject,
      };
    },
    updateSelectedProject(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
