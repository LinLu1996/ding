import { initialProjects } from '../../../services/fieldManage';
import { handleResponse } from '../../../utils/globalUtils';

export default {
  namespace: 'venuefieldManage',

  state: {
    projects: [],
    selectedProject: undefined,
  },

  effects: {
    * initialProjects(_, { put, call, select }) {
      const selectedProject = yield select(state => state.venuefieldManage.selectedProject);
      const response = yield call(initialProjects);
      if (handleResponse(response)) {
        yield put({
          type: 'updateProjects',
          payload: {
            projects: response.data,
            selectedProject: selectedProject || (response.data.length > 0 ? response.data[0].id : undefined),
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
