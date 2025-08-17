-- 友情链接数据库表结构 (PostgreSQL DDL)
-- 创建时间: 2024
-- 描述: 用于存储友情链接卡片的所有相关信息

-- 创建友情链接主表
CREATE TABLE friend_links (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '网站名称',
    description TEXT COMMENT '网站描述',
    avatar VARCHAR(500) COMMENT '头像URL',
    url VARCHAR(500) NOT NULL COMMENT '网站链接',
    is_special BOOLEAN DEFAULT FALSE COMMENT '是否为特殊卡片',
    status_label VARCHAR(50) COMMENT '状态标签(如PREMIUM, VIP等)',
    sort_order INTEGER DEFAULT 0 COMMENT '排序权重',
    status INTEGER DEFAULT 1 COMMENT '状态: 1-正常, 0-禁用, -1-删除',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    created_by INTEGER COMMENT '创建人ID',
    updated_by INTEGER COMMENT '更新人ID'
);

-- 创建社交链接表
CREATE TABLE friend_link_social_icons (
    id SERIAL PRIMARY KEY,
    friend_link_id INTEGER NOT NULL REFERENCES friend_links(id) ON DELETE CASCADE,
    icon_type VARCHAR(20) NOT NULL COMMENT '图标类型: qq, wechat, heart, star等',
    icon_url VARCHAR(500) COMMENT '社交链接URL',
    sort_order INTEGER DEFAULT 0 COMMENT '排序权重',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间'
);

-- 创建索引
CREATE INDEX idx_friend_links_status ON friend_links(status);
CREATE INDEX idx_friend_links_is_special ON friend_links(is_special);
CREATE INDEX idx_friend_links_sort_order ON friend_links(sort_order DESC);
CREATE INDEX idx_friend_links_created_at ON friend_links(created_at DESC);
CREATE INDEX idx_friend_links_name ON friend_links(name);

CREATE INDEX idx_social_icons_friend_link_id ON friend_link_social_icons(friend_link_id);
CREATE INDEX idx_social_icons_sort_order ON friend_link_social_icons(sort_order);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为主表创建更新时间触发器
CREATE TRIGGER update_friend_links_updated_at
    BEFORE UPDATE ON friend_links
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 为社交链接表创建更新时间触发器
CREATE TRIGGER update_friend_link_social_icons_updated_at
    BEFORE UPDATE ON friend_link_social_icons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 插入示例数据
INSERT INTO friend_links (name, description, avatar, url, is_special, status_label, sort_order) VALUES
('白鲸_Cofcat', '你好，我叫白鲸，你也可以叫我Macon，我是一只猫猫，还是一个程序员。', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop&crop=face', 'https://example1.com', false, null, 1),
('狼兽墨风', '一只代码里游泳的狼，是一只清爽LOvO', 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200&h=200&fit=crop&crop=face', 'https://example2.com', false, null, 2),
('笑小白', '你好我是笑小白，教育家家小白，喜欢宅家', 'https://images.unsplash.com/photo-1472491235688-bdc81a63246e?w=200&h=200&fit=crop&crop=face', 'https://example3.com', true, 'PREMIUM', 3),
('技术博客', '分享前端技术，记录学习心得', 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=200&h=200&fit=crop&crop=face', 'https://example4.com', false, null, 4),
('设计师小王', 'UI/UX设计师，热爱创意设计', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face', 'https://example5.com', false, null, 5),
('全栈开发者', '专注全栈开发，分享技术经验', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face', 'https://example6.com', true, 'VIP', 6),
('产品经理日记', '产品思维，用户体验，商业洞察', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face', 'https://example7.com', false, null, 7),
('算法工程师', '机器学习，深度学习，算法优化', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face', 'https://example8.com', false, null, 8),
('开源爱好者', '热爱开源，贡献代码，分享知识', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop&crop=face', 'https://example9.com', false, null, 9);

-- 插入社交链接示例数据
INSERT INTO friend_link_social_icons (friend_link_id, icon_type, icon_url, sort_order) VALUES
(1, 'qq', 'https://example.com/qq', 1),
(1, 'heart', 'https://example.com/blog', 2),
(2, 'wechat', 'https://example.com/wechat', 1),
(3, 'qq', 'https://example.com/qq', 1),
(3, 'wechat', 'https://example.com/wechat', 2),
(3, 'heart', 'https://example.com/blog', 3),
(4, 'star', 'https://example.com/github', 1),
(4, 'heart', 'https://example.com/blog', 2),
(5, 'heart', 'https://example.com/portfolio', 1),
(5, 'star', 'https://example.com/dribbble', 2),
(6, 'star', 'https://example.com/github', 1),
(6, 'heart', 'https://example.com/blog', 2),
(7, 'qq', 'https://example.com/qq', 1),
(7, 'heart', 'https://example.com/blog', 2),
(8, 'star', 'https://example.com/github', 1),
(8, 'heart', 'https://example.com/blog', 2),
(9, 'star', 'https://example.com/github', 1),
(9, 'heart', 'https://example.com/blog', 2);

-- 查询友情链接及其社交图标的视图
CREATE VIEW v_friend_links_with_social AS
SELECT 
    fl.id,
    fl.name,
    fl.description,
    fl.avatar,
    fl.url,
    fl.is_special,
    fl.status_label,
    fl.sort_order,
    fl.status,
    fl.created_at,
    fl.updated_at,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'type', fls.icon_type,
                'url', fls.icon_url
            ) ORDER BY fls.sort_order
        ) FILTER (WHERE fls.id IS NOT NULL),
        '[]'::json
    ) AS social_icons
FROM friend_links fl
LEFT JOIN friend_link_social_icons fls ON fl.id = fls.friend_link_id
WHERE fl.status = 1
GROUP BY fl.id, fl.name, fl.description, fl.avatar, fl.url, fl.is_special, fl.status_label, fl.sort_order, fl.status, fl.created_at, fl.updated_at
ORDER BY fl.sort_order DESC, fl.created_at DESC;

-- 分页查询函数
CREATE OR REPLACE FUNCTION get_friend_links_paginated(
    p_page INTEGER DEFAULT 1,
    p_page_size INTEGER DEFAULT 12,
    p_search_keyword VARCHAR DEFAULT NULL
)
RETURNS TABLE(
    id INTEGER,
    name VARCHAR,
    description TEXT,
    avatar VARCHAR,
    url VARCHAR,
    is_special BOOLEAN,
    status_label VARCHAR,
    social_icons JSON,
    total_count BIGINT
) AS $$
DECLARE
    v_offset INTEGER;
    v_total_count BIGINT;
BEGIN
    v_offset := (p_page - 1) * p_page_size;
    
    -- 获取总数
    SELECT COUNT(*) INTO v_total_count
    FROM friend_links fl
    WHERE fl.status = 1
    AND (p_search_keyword IS NULL OR fl.name ILIKE '%' || p_search_keyword || '%');
    
    -- 返回分页数据
    RETURN QUERY
    SELECT 
        vfl.id,
        vfl.name,
        vfl.description,
        vfl.avatar,
        vfl.url,
        vfl.is_special,
        vfl.status_label,
        vfl.social_icons,
        v_total_count
    FROM v_friend_links_with_social vfl
    WHERE (p_search_keyword IS NULL OR vfl.name ILIKE '%' || p_search_keyword || '%')
    ORDER BY vfl.sort_order DESC, vfl.created_at DESC
    LIMIT p_page_size
    OFFSET v_offset;
END;
$$ LANGUAGE plpgsql;

-- 添加表注释
COMMENT ON TABLE friend_links IS '友情链接主表';
COMMENT ON TABLE friend_link_social_icons IS '友情链接社交图标表';
COMMENT ON VIEW v_friend_links_with_social IS '友情链接及社交图标视图';
COMMENT ON FUNCTION get_friend_links_paginated IS '分页查询友情链接函数';