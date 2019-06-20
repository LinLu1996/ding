export default [
  // // user
  // {
  //   path: '/user',
  //   component: '../layouts/UserLayout',
  //   routes: [
  //     { path: '/user', redirect: '/user/login' },
  //     { path: '/user/login', component: './User/Login' },
  //     { path: '/user/register', component: './User/Register' },
  //     { path: '/user/register-result', component: './User/RegisterResult' },
  //   ],
  // },
  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    // Routes: ['src/pages/Authorized'],
    // authority: ['admin', 'user'],
    routes: [
      // dashboard
      { path: '/', redirect: '/home' },

      {
        // 默认首页欢迎页面
        name: 'home',
        path: '/home',
        component: './Home',
        hideInMenu: true,
      },
      {
        // 前台
        name: 'cashier',
        icon: 'user',
        path: '/cashier',
        authority:
          [
            'jis_platform_dc_cashier',
            'jis_platform_dc_cashier_sale',
            'jis_platform_dc_cashier_order',
            'jis_platform_dc_cashier_in_out',
            'jis_platform_dc_cashier_change',
            'jis_platform_dc_usageRecord',
            'jis_platform_dc_card_sale',
          ],
        routes: [
          {
            path: '/cashier/cashierList',
            name: 'list',
            authority: 'jis_platform_dc_cashier_sale',
            routes: [
              {
                path: '/cashier/cashierList',
                redirect: '/cashier/cashierList/index',
              },
              {
                // 售票列表
                path: '/cashier/cashierList/index',
                component: './Cashier/index',
                authority: 'jis_platform_dc_cashier_sale',
              },
              {
                // 售票下单
                path: '/cashier/cashierList/add',
                component: './Cashier/TicketSelling',
                authority: 'jis_platform_dc_cashier_sale_ticket',
              },
              {
                // 售票详情
                path: '/cashier/cashierList/detail',
                component: './Cashier/detail',
                authority: 'jis_platform_dc_cashier_sale_detail',
              },
            ],
          },
          {
            // 订场
            path: '/cashier/bookPlace',
            name: 'book',
            authority: 'jis_platform_dc_cashier_order',
            routes: [
              {
                path: '/cashier/bookPlace',
                redirect: '/cashier/bookPlace/index',
              },
              {
                path: '/cashier/bookPlace/index',
                component: './Cashier/bookPlace',
                authority: 'jis_platform_dc_cashier_order',
              },
            ],
          },
          {
            // 核销
            path: '/cashier/admission',
            name: 'admissionList',
            authority: 'jis_platform_dc_cashier_in_out',
            routes: [
              {
                path: '/cashier/admission',
                redirect: '/cashier/admission/list',
              },
              {
                path: '/cashier/admission/list',
                component: './Cashier/admission',
                authority: 'jis_platform_dc_cashier_in_out',
              },
            ],
          },
          // {
          //   // 团体票入场
          //   path: '/cashier/groupTicket',
          //   name: 'groupTicket',
          //   component: './Cashier/GroupTicket'
          // },
          {
            // 交班统计
            path: '/cashier/handStatistics',
            name: 'hand',
            authority: 'jis_platform_dc_cashier_change',
            routes: [
              {
                path: '/cashier/handStatistics',
                redirect: '/cashier/handStatistics/index',
              },
              {
                path: '/cashier/handStatistics/index',
                component: './Cashier/handStatistics',
                authority: 'jis_platform_dc_cashier_change',
              },
            ],
          },
          {
            // 使用记录
            name: 'usageRecord',
            path: '/cashier/usageRecord',
            component: './UsageRecord',
            authority: 'jis_platform_dc_usageRecord',
          },
          {
            // 销售管理
            path: '/cashier/saleList',
            name: 'sale',
            authority: 'jis_platform_dc_card_sale',
            routes: [
              {
                path: '/cashier/saleList',
                redirect: '/cashier/saleList/list',
              },
              {
                path: '/cashier/saleList/list',
                component: './CardManage/saleList.js',
                authority: 'jis_platform_dc_card_sale',
              },
              {
                // 开卡
                path: '/cashier/saleList/activateCard',
                component: './CardManage/activateCard.js',
                authority: 'jis_platform_dc_card_sale_new',
              },
              {
                // 编辑卡
                path: '/cashier/saleList/edit',
                component: './CardManage/cardForm',
                authority: 'jis_platform_dc_card_sale_edit',
              },
              {
                // 更换手铐
                path: '/cashier/saleList/replaceBracelet',
                component: './CardManage/cardForm',
                authority: 'jis_platform_dc_card_sale_edit',
              },
              {
                // 储值卡
                path: '/cashier/saleList/rechargeCard',
                component: './CardManage/rechargeCard.js',
                authority: 'jis_platform_dc_card_sale_recharge',
              },
              {
                // 补换卡
                path: '/cashier/saleList/replacement',
                component: './CardManage/replacement.js',
                authority: 'jis_platform_dc_card_sale_replace',
              },
              {
                // 交易记录
                path: '/cashier/saleList/transaction',
                component: './CardManage/transaction.js',
                authority: 'jis_platform_dc_card_sale_record',
              },
              // 退卡
              {
                path: '/cashier/saleList/refund',
                component: './CardManage/refundCard.js',
              },
              // 详情
              {
                path: '/cashier/saleList/detail',
                component: './CardManage/cardForm',
                authority: 'jis_platform_dc_card_sale_detail',
              },
            ],
          },
        ],
      },
      {
        // 通知消息
        name: 'notificationMessage',
        icon: 'star',
        path: '/notificationMessage',
        authority: 'jis_platform_dc_notice',
        routes: [
          {
            path: '/notificationMessage',
            component: './NotificationMessage/index',
          },
          {
            // 查看
            path: '/notificationMessage/details',
            component: './NotificationMessage/details',
            authority: 'jis_platform_dc_notice_detail',
          },
          {
            // 新增
            path: '/notificationMessage/add',
            component: './NotificationMessage/add',
            authority: 'jis_platform_dc_notice_add',
          },
          {
            // 编辑
            path: '/notificationMessage/edit',
            component: './NotificationMessage/edit',
            authority: 'jis_platform_dc_notice_edit',
          },
        ],
      },

      {
        // 订单管理
        name: 'order',
        icon: 'user',
        path: '/order',
        authority:
          [
            'jis_platform_dc_order',
            'jis_platform_dc_saleorder',
            'jis_platform_dc_record',
            'jis_platform_dc_couponList',
          ],
        routes: [
          {
            // 销售订单
            path: '/order/saleOrder',
            name: 'list',
            authority: 'jis_platform_dc_saleorder',
            routes: [
              {
                path: '/order/saleOrder',
                redirect: '/order/saleOrder/list',
              },
              {
                path: '/order/saleOrder/list',
                component: './Order/saleOrder',
                authority: 'jis_platform_dc_saleorder',
              },
              {
                // 购票详情
                path: '/order/saleOrder/ticketDetails',
                component: './Order/ticketDetails',
                authority: 'jis_platform_dc_saleorder_detail',
              },
              {
                // 订场详情
                path: '/order/saleOrder/venueDetails',
                component: './Order/venueDetails',
                authority: 'jis_platform_dc_saleorder_detail',
              },
              {
                // 退款
                path: '/order/saleOrder/refund',
                component: './Order/refund',
                authority: 'jis_platform_dc_saleorder_refund',
              },
              // 退票
              {
                path: '/order/saleOrder/refundTicket',
                component: './Order/refundTicket.js',
              },

            ],
          },
          {
            // 消费记录
            path: '/order/consumeRecord',
            name: 'consumeRecordList',
            authority: 'jis_platform_dc_record',
            routes: [
              {
                path: '/order/consumeRecord',
                redirect: '/order/consumeRecord/list',
              },
              {
                path: '/order/consumeRecord/list',
                component: './Order/consumeRecord',
                authority: 'jis_platform_dc_record',
              },
              {
                // 消费详情
                path: '/order/consumeRecord/details',
                component: './Order/recordDetails',
                authority: 'jis_platform_dc_record_detail',
              },
            ],
          },
          {
            // 票券列表
            path: '/order/coupon',
            name: 'couponList',
            authority: 'jis_platform_dc_couponList',
            routes: [
              {
                path: '/order/coupon',
                redirect: '/order/coupon/list',
              },
              {
                path: '/order/coupon/list',
                component: './Order/couponList',
                authority: 'jis_platform_dc_couponList',
              },
              {
                // 票券详情
                path: '/order/coupon/couponTicketDetails',
                component: './Order/couponTicketDetails',
                authority: 'jis_platform_dc_couponList_detail',
              },
              {
                // 出票
                path: '/order/coupon/couponVenueDetails',
                component: './Order/couponVenueDetails',
                authority: 'jis_platform_dc_couponList_ticket',
              },
            ],
          },
        ],
      },

      {
        // 订场管理
        name: 'fieldManage',
        icon: 'setting',
        path: '/fieldManage',
        authority: 'jis_platform_dc_booking',
        routes: [
          {
            path: '/fieldManage',
            redirect: '/fieldManage/priceSetting',
          },
          {
            // 价格设定
            name: 'priceSetting',
            path: '/fieldManage/priceSetting',
            hideChildrenInMenu: true,
            authority: 'jis_platform_dc_booking_price',
            routes: [
              {
                path: '/fieldManage/priceSetting',
                redirect: '/fieldManage/priceSetting/set',
              },
              {
                path: '/fieldManage/priceSetting/set',
                component: './FieldManage/PriceSetting',
                authority: 'jis_platform_dc_booking_price',
              },
              {
                // 价格预览
                name: 'preview',
                path: '/fieldManage/priceSetting/preview',
                component: './FieldManage/Preview',
                authority: 'jis_platform_dc_booking_price_preview',
              },
            ],
          },
        ],
      },
      {
        // 门票管理
        name: 'ticket',
        icon: 'user',
        path: '/ticket',
        authority:
          [
            'jis_platform_dc_ticket',
            'jis_platform_dc_ticket_list',
            'jis_platform_dc_ticket_stock',
          ],
        routes: [
          {
            // 门票列表
            path: '/ticket/ticketList',
            name: 'list',
            hideChildrenInMenu: true,
            authority: 'jis_platform_dc_ticket_list',
            routes: [
              {
                path: '/ticket/ticketList',
                redirect: '/ticket/ticketList/list',
              },
              {
                path: '/ticket/ticketList/list',
                component: './TicketMan',
                authority: 'jis_platform_dc_ticket_list',
              },
              {
                // 新增/编辑
                path: '/ticket/ticketList/add',
                component: './TicketMan/add',
                name:'ticketAdd',
                authority: ['jis_platform_dc_ticket_list_add', 'jis_platform_dc_ticket_list_edit'],
              },
              {
                // 详情
                path: '/ticket/ticketList/detail',
                component: './TicketMan/detail',
                authority: 'jis_platform_dc_ticket_list_detail',
              },
            ],
          },
          {
            // 库存调整
            path: '/ticket/stockList',
            name: 'stock',
            authority: 'jis_platform_dc_ticket_stock',
            routes: [
              {
                path: '/ticket/stockList',
                redirect: '/ticket/stockList/list',
              },
              {
                path: '/ticket/stockList/list',
                component: './TicketMan/stock.js',
                authority: 'jis_platform_dc_ticket_stock',
              },
              {
                // 出库
                path: '/ticket/stockList/outStock',
                component: './TicketMan/outStock',
                authority: 'jis_platform_dc_ticket_stock_out',
              },
              {
                // 入库
                path: '/ticket/stockList/inStock',
                component: './TicketMan/outStock',
                authority: 'jis_platform_dc_ticket_stock_in',
              },
              {
                // 详情
                path: '/ticket/stockList/stockDetail',
                component: './TicketMan/stockDetail',
              },
            ],
          },
        ],
      },
      {
        // 卡管理
        name: 'card',
        icon: 'user',
        path: '/card',
        authority:
          [
            'jis_platform_dc_card',
            'jis_platform_dc_card_list',
            'jis_platform_dc_card_year',
            'jis_platform_dc_card_times',
            'jis_platform_dc_card_money',
            'jis_platform_dc_card_stock',
            // 'jis_platform_dc_card_sale',
          ],
        routes: [
          {
            // 卡列表
            path: '/card/cardList',
            name: 'list',
            authority: 'jis_platform_dc_card_list',
            routes: [
              {
                path: '/card/cardList',
                redirect: '/card/cardList/list',
              },
              {
                path: '/card/cardList/list',
                component: './CardManage',
                authority: 'jis_platform_dc_card_list',
              },
              {
                // 新增/编辑
                path: '/card/cardList/add',
                component: './CardManage/add',
                authority: ['jis_platform_dc_card_list_add', 'jis_platform_dc_card_list_edit'],
              },
            ],
          },
          {
            // 年卡
            name: 'yearCard',
            path: '/card/yearCard',
            component: './CardSetting',
            authority:'jis_platform_dc_card_year',
          },
          {
            // 次卡
            name: 'subCard',
            path: '/card/subCard',
            component: './CardSetting',
            authority:'jis_platform_dc_card_times',
          },
          {
            // 储值卡
            name: 'storedCard',
            path: '/card/storedCard',
            component: './CardSetting',
            authority:'jis_platform_dc_card_money',
          },
          {
            // 库存调整
            path: '/card/stockList',
            name: 'stock',
            authority: 'jis_platform_dc_card_stock',
            routes: [
              {
                path: '/card/stockList',
                redirect: '/card/stockList/list',
              },
              {
                path: '/card/stockList/list',
                component: './CardManage/stock.js',
                authority: 'jis_platform_dc_card_stock',
              },
              {
                // 出库
                path: '/card/stockList/outStock',
                component: './CardManage/outStock',
                authority: 'jis_platform_dc_card_stock_out',
              },
              {
                // 入库
                path: '/card/stockList/inStock',
                component: './CardManage/outStock',
                authority: 'jis_platform_dc_card_stock_in',
              },
              {
                // 库存详情
                path: '/card/stockList/stockDetail',
                component: './CardManage/stockDetail',
              },
            ],
          },
          // {
          //   // 销售管理
          //   path: '/card/saleList',
          //   name: 'sale',
          //   authority: 'jis_platform_dc_card_sale',
          //   routes: [
          //     {
          //       path: '/card/saleList',
          //       redirect: '/card/saleList/list',
          //     },
          //     {
          //       path: '/card/saleList/list',
          //       component: './CardManage/saleList.js',
          //       authority: 'jis_platform_dc_card_sale',
          //     },
          //     {
          //       // 开卡
          //       path: '/card/saleList/activateCard',
          //       component: './CardManage/activateCard.js',
          //       authority: 'jis_platform_dc_card_sale_new',
          //     },
          //     {
          //       // 编辑卡
          //       path: '/card/saleList/edit',
          //       component: './CardManage/cardForm',
          //       authority: 'jis_platform_dc_card_sale_edit',
          //     },
          //     {
          //       // 储值卡
          //       path: '/card/saleList/rechargeCard',
          //       component: './CardManage/rechargeCard.js',
          //       authority: 'jis_platform_dc_card_sale_recharge',
          //     },
          //     {
          //       // 补换卡
          //       path: '/card/saleList/replacement',
          //       component: './CardManage/replacement.js',
          //       authority: 'jis_platform_dc_card_sale_replace',
          //     },
          //     {
          //       // 交易记录
          //       path: '/card/saleList/transaction',
          //       component: './CardManage/transaction.js',
          //       authority: 'jis_platform_dc_card_sale_record',
          //     },
          //     // 退卡
          //     {
          //       path: '/card/saleList/refund',
          //       component: './CardManage/refundCard.js',
          //     },
          //     // 详情
          //     {
          //       path: '/card/saleList/detail',
          //       component: './CardManage/cardForm',
          //       authority: 'jis_platform_dc_card_sale_detail',
          //     },
          //   ],
          // },
        ],
      },
      {
        // 场馆信息
        name: 'venue',
        icon: 'user',
        path: '/venue',
        authority:
          [
            'jis_platform_dc_venue',
            'jis_platform_dc_venue_list',
            'jis_platform_dc_venue_cournt_list',
          ],
        routes: [
          {
            // 场馆列表
            path: '/venue/venueList',
            name: 'list',
            hideChildrenInMenu: true,
            authority: 'jis_platform_dc_venue_list',
            routes: [
              {
                path: '/venue/venueList',
                redirect: '/venue/venueList/list',
              },
              {
                path: '/venue/venueList/list',
                component: './Venue/TableList',
                authority: 'jis_platform_dc_venue_list',
              },
              {
                // 新增/编辑
                name: 'venueAdd',
                path: '/venue/venueList/list/add',
                component: './Venue/add',
                authority: ['jis_platform_dc_venue_list_add', 'jis_platform_dc_venue_list_edit']
              },
              {
                // 闭馆
                path: '/venue/venueList/list/close',
                component: './Venue/closeVenue',
                authority: 'jis_platform_dc_venue_list_colse',
              },
            ],
          },
          {
            // 场地列表
            path: '/venue/siteList',
            name: 'siteList',
            authority: 'jis_platform_dc_venue_cournt_list',
            routes: [
              {
                path: '/venue/siteList',
                redirect: '/venue/siteList/list',
              },
              {
                path: '/venue/siteList/list',
                component: './Venue/SiteList',
                authority: 'jis_platform_dc_venue_cournt_list',
              },
              {
                // 关闭场地
                path: '/venue/siteList/close',
                component: './Venue/closeCourt',
                authority: 'jis_platform_dc_court_colse',
              },
            ],
          },
        ],
      },
      {
        // 系统设置
        name: 'systemSet',
        icon: 'user',
        path: '/systemSet',
        authority:
          [
            'jis_platform_dc_system',
            'jis_platform_dc_system_list',
            'jis_platform_dc_system_power',
            'jis_platform_dc_system_company',
            'jis_platform_dc_system_date',
          ],
        routes: [
          {
            // 项目列表
            path: '/systemSet/systemSetList',
            name: 'list',
            hideChildrenInMenu: true,
            authority: 'jis_platform_dc_system_list',
            routes: [
              {
                path: '/systemSet/systemSetList',
                redirect: '/systemSet/systemSetList/list',
              },
              {
                path: '/systemSet/systemSetList/list',
                component: './SystemSetup',
                authority: 'jis_platform_dc_system_list',
              },
              {
                // 新增
                name:'listAdd',
                path: '/systemSet/systemSetList/add',
                component: './SystemSetup/add.js',
                authority: 'jis_platform_dc_system_list_add',
              },
              {
                // 编辑
                path: '/systemSet/systemSetList/edit',
                component: './SystemSetup/add.js',
                authority: 'jis_platform_dc_system_list_edit',
              },
            ],
          },
          {
            // 项目权限
            path: '/systemSet/permission',
            name: 'permission',
            authority: 'jis_platform_dc_system_power',
            routes: [
              {
                path: '/systemSet/permission',
                redirect: '/systemSet/permission/setList',
              },
              {
                path: '/systemSet/permission/setList',
                component: './SystemSetup/permission.js',
                authority: 'jis_platform_dc_system_power',
              },
              {
                // 设置
                path: '/systemSet/permission/set',
                component: './SystemSetup/set.js',
                authority: 'jis_platform_dc_system_power_set',
              },
            ],
          },
          {
            // 公司信息
            path: '/systemSet/companyInformation',
            name: 'companyInformation',
            authority: 'jis_platform_dc_system_company',
            routes: [
              {
                path: '/systemSet/companyInformation',
                redirect: '/systemSet/companyInformation/detail',
              },
              {
                path: '/systemSet/companyInformation/detail',
                component: './SystemSetup/companyInformation.js',
                authority: 'jis_platform_dc_system_company',
              },
            ],
          },
          {
            // 日期设置
            path: '/systemSet/dateSettings',
            name: 'dateSettings',
            authority: 'jis_platform_dc_system_date',
            routes: [
              {
                path: '/systemSet/dateSettings',
                redirect: '/systemSet/dateSettings/index',
              },
              {
                path: '/systemSet/dateSettings/index',
                component: './SystemSetup/DateSettings',
                authority: 'jis_platform_dc_system_date',
              },
              {
                path: '/systemSet/dateSettings/monthView',
                component: './SystemSetup/DateSettings/MonthView',
                authority: 'jis_platform_dc_system_date',
              },
            ],
          },
        ],
      },
      {
        // 报表
        name: 'reportForm',
        icon: 'credit-card',
        path: '/reportForm',
        component: './ReportForm',
        authority: 'jis_platform_dc_report',
      },
      {
        // 广告
        name: 'adv',
        icon: 'share-alt',
        path: '/adv',
        component: './Advertisement',
        authority: 'jis_platform_dc_adv'
      },
      {
        component: '404',
      },
    ],
  },
];
