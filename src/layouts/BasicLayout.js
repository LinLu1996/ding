import LoadingComponent from '@/components/PageLoading';
import { Form, Layout } from 'antd';
import classNames from 'classnames'; // 提供很好的动态css样式功能
import { connect } from 'dva'; // 通过 connect 绑定数据,将对应的models数据作为props数据传递进来
// import { enquireScreen } from 'enquire-js'; // enquire.js 响应css媒体查询的轻量级javascript库
// import { SiderMenu ,GlobalHeader } from 'jis-platform-enterprise-common-web';
// import GlobalHeader from '@/components/GlobalHeader';
import isEqual from 'lodash/isEqual';
import memoizeOne from 'memoize-one';
import pathToRegexp from 'path-to-regexp';
import React from 'react';
import { ContainerQuery } from 'react-container-query'; // True modularity in styling responsive component. 真正的模块化响应式组件
import DocumentTitle from 'react-document-title'; // react是单页应用，根据不同路由改变对应的文档title
import { formatMessage } from 'umi/locale';
import Context from './MenuContext';
import Authorized, { reloadAuthorized } from '../utils/Authorized';
import { setAuthority } from '../utils/authority';

const { Content } = Layout;

// Conversion router to menu.
function formatter(data, parentPath = '', parentAuthority, parentName) {
  return data.map(item => {
    let locale = 'menu';
    if (parentName && item.name) {
      locale = `${parentName}.${item.name}`;
    } else if (item.name) {
      locale = `menu.${item.name}`;
    } else if (parentName) {
      locale = parentName;
    }
    const result = {
      ...item,
      locale,
      authority: item.authority || parentAuthority,
    };
    if (item.routes) {
      const children = formatter(item.routes, `${parentPath}${item.path}/`, item.authority, locale);
      // Reduce memory usage
      result.children = children;
    }
    delete result.routes;
    return result;
  });
}

/**
 * 根据菜单取得重定向地址
 */
const redirectData = [];
const getRedirect = (item) => {
  if (item && item.children) {
    if (item.children[0] && item.children[0].path && item.path !== item.children[0].path) {
      redirectData.push({
        from: `${item.path}`,
        to: `${item.children[0].path}`,
      });
      item.children.forEach((children) => {
        getRedirect(children);
      });
    }
  }
};

// 检查用户是否有目标权限
const checkAuthority = (targetAuthority, menus = []) => {
  const isArray = Array.isArray(targetAuthority);
  if (menus) {
    return !!menus.find(
      menu => isArray ? targetAuthority.indexOf(menu) >= 0 : menu === targetAuthority
    );
  }
  return false;
};

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};

@Form.create()
class BasicLayout extends React.PureComponent {

  constructor(props) {
    super(props);
    this.getPageTitle = memoizeOne(this.getPageTitle);
    this.getBreadcrumbNameMap = memoizeOne(this.getBreadcrumbNameMap, isEqual);
    this.breadcrumbNameMap = this.getBreadcrumbNameMap();
    this.state = {
      menuData : [],
    }
  }

  componentWillMount(){
    const {
      dispatch,
    } = this.props;

    // dispatch({
    //   type: 'user/fetchCurrent',
    // });

    // dispatch({
    //   type: 'user/fetchFunction',
    // }) .then(() => {
    //   this.fetchAuth();
    // });
  }

  componentDidUpdate() {
    this.breadcrumbNameMap = this.getBreadcrumbNameMap();
  }

  getPageTitle = pathname => {
    let currRouterData = null;
    // match params path
    Object.keys(this.breadcrumbNameMap).forEach(key => {
      if (pathToRegexp(key).test(pathname)) {
        currRouterData = this.breadcrumbNameMap[key];
      }
    });
    if (!currRouterData) {
      return '订场管理';
    }
    const title = formatMessage({
      id: currRouterData.locale || currRouterData.name,
      defaultMessage: currRouterData.name,
    });
    return `${title} - 订场管理`;
  };

  getContentStyle = () => {
    return {
      margin: '24px 24px 0',
      paddingTop : 24 ,
    };
  };

  /**
   * 获取面包屑映射
   * @param {Object} menuData 菜单配置
   */
  getBreadcrumbNameMap() {
    const routerMap = {};
    const mergeMenuAndRouter = data => {
      data.forEach(menuItem => {
        if (menuItem.children) {
          mergeMenuAndRouter(menuItem.children);
        }
        // Reduce memory usage
        routerMap[menuItem.path] = menuItem;
      });
    };
    mergeMenuAndRouter(this.getMenuData());
    return routerMap;
  }

  getContext() {
    const { location } = this.props;
    return {
      location,
      breadcrumbNameMap: this.breadcrumbNameMap,
    };
  }

  getMenuData() {
    const {
      route: { routes },
    } = this.props;
    return formatter(routes);
  }

  fetchAuth = () => {
    const {
      user: { authority:{menus, functions} },
    } = this.props;
    setAuthority([]);
    if(menus && menus.length && functions && functions.length){
      setAuthority(this.collectAuth(menus, functions));

    }

    reloadAuthorized();
    this.filterUnAuthorizedMenudata();
  };

  collectAuth = (menus, functions) => {
    const list = [];
    menus.forEach(auth => {
      if (auth.code) {
        list.push(auth.code);
      }
    });
    functions.forEach(auth => {
      if (auth.code) {
        list.push(auth.code);
      }
    });
    return list;
  };

  // 过滤掉无权限的菜单,并生成重定向的url 映射
  filterUnAuthorizedMenudata = () => {
    let authorizedMenuData = this.getMenuData().map(menu => this.iteratorMenu(menu)).filter(menu => menu);
    authorizedMenuData.forEach(getRedirect);
    this.setState({
      menuData : authorizedMenuData,
    })
  };

  // 遍历菜单及子集
  iteratorMenu = (menu) => {
    let result = {};
    if (this.validateAuthorityMenuItem(menu)) {
      result = { ...menu };
      if (menu.children && menu.children.length > 0) {
        result.children = [];
        menu.children.forEach((item) => {
          const child = this.iteratorMenu(item);
          if (child) {
            result.children.push(child);
          }
        });
      }
      return result;
    }
    return undefined;
  };

  // 验证菜单是否有权限
  validateAuthorityMenuItem = (menuItem) => {
    if (!menuItem.authority) {
      return true;
    }
    const menus = JSON.parse(localStorage.getItem('juss-auth'));
    return checkAuthority(menuItem.authority, menus);
  };

  // 重定向页面
  redirectIfRoot = () => {
    const { hash } = window.location;
    const { location: { protocol, host, pathname } } = window;
    const redirectItem = redirectData.find(item => `#${item.from}` === hash);
    if (redirectItem) {
      window.location.href = `${protocol}//${host}${pathname}#${redirectItem.to}`;
      return true;
    }
    if (hash === '#/' && redirectData.length > 0) {
      window.location.href = `${protocol}//${host}${pathname}#${redirectData[0].to}`;
      return true;
    }
    return false;
  };


  getRouterAuthority = (pathname, routeData) => {
    let routeAuthority = ['noAuthority'];
    const getAuthority = (key, routes) => {
      routes.map(route => {
        if (route.path && pathToRegexp(route.path).test(key)) {
          routeAuthority = route.authority;
        } else if (route.routes) {
          routeAuthority = getAuthority(key, route.routes);
        }
        return route;
      });
      return routeAuthority;
    };
    return getAuthority(pathname, routeData);
  };

  renderContent = () => {
    const { children, user: { currentUser }, location:{pathname}, route:{routes} } = this.props;
    const { menuData } = this.state;
    const layout = (
      this.redirectIfRoot()  ? null :
        (
          <Layout>
            <GlobalHeader currentUser={currentUser} subTitle='订场管理' />
            <Layout>
              <SiderMenu
                theme='dark'
                menuData={menuData}
                isMobile={false}
                title='订场管理'
                location={location} // eslint-disable-line
              />
              <Content style={this.getContentStyle()}>{children}</Content>
            </Layout>
          </Layout>
        )
    );

    return (
      <ContainerQuery query={query}>
        {params => (
          <Context.Provider value={this.getContext()}>
            <div className={classNames(params)}>{layout}</div>
          </Context.Provider>
        )}
      </ContainerQuery>
    );
  };

  render() {
    const { location: { pathname }, user:{currentUser} } = this.props;
    const { menuData } = this.state;
    const container = (currentUser && currentUser.username && menuData.length ?
        this.renderContent() :
        <LoadingComponent />
    );
    return (
      <React.Fragment>
        <DocumentTitle title={this.getPageTitle(pathname)}>
          {container}
        </DocumentTitle>
      </React.Fragment>
    );
  }
}

// BasicLayout = Form.create({})(BasicLayout);
export default connect(({ user }) => ({
  // menuData: menu.menuData,
  user,
}))(BasicLayout);
