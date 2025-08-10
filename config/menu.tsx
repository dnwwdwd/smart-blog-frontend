import {MenuDataItem} from "@ant-design/pro-layout";
import {BookOutlined, HomeOutlined, ReadOutlined, TagsOutlined, UserOutlined} from "@ant-design/icons";

export const menus = [
    {
        path: '/user/login',
        name: '用户登录',
        hideInMenu: true,
    },
    {
        path: '/user/register',
        name: '用户注册',
        hideInMenu: true,
    },
    {
        path: '/',
        name: '首页',
        icon: <HomeOutlined/>,
    },
    {
        path: '/articles',
        name: '文章',
        icon: <ReadOutlined/>,
    },
    {
        path: '/columns',
        name: '专栏',
        icon: <BookOutlined/>,
    },
    {
        path: '/tags',
        name: '标签',
        icon: <TagsOutlined/>,
    },
    {
        path: '/about',
        name: '关于',
        icon: <UserOutlined/>,
    },
    // {
    //     path: '/admin',
    //     name: '管理后台',
    //     icon: <CrownOutlined/>,
    //     access: 'admin',
    //     children: [
    //         {
    //             path: '/admin/articles',
    //             name: '文章管理',
    //             access: 'admin',
    //         },
    //         {
    //             path: '/admin/categories',
    //             name: '分类管理',
    //             access: 'admin',
    //         },
    //         {
    //             path: '/admin/tags',
    //             name: '标签管理',
    //             access: 'admin',
    //         },
    //         {
    //             path: '/admin/users',
    //             name: '用户管理',
    //             access: 'admin',
    //         },
    //     ],
    // },
] as MenuDataItem[];

// 根据路径查找所有菜单
export const findAllMenuItemByPath = (path: string): MenuDataItem | null => {
    return findMenuItemByPath(menus, path);
};

export const findMenuItemByPath = (menus: MenuDataItem[], path: string): MenuDataItem | null => {
    for (const menu of menus) {
        if (menu.path === path) {
            return menu;
        }
        if (menu.children) {
            const matchedMenuItem = findMenuItemByPath(menu.children, path);
            if (matchedMenuItem) {
                return matchedMenuItem;
            }
        }
    }
    return null;
};