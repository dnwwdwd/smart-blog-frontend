/* eslint-disable @typescript-eslint/no-empty-object-type */
import React from "react";
import {Input, message} from "antd";
import {SearchOutlined} from "@ant-design/icons";

interface Props {

}

/**
 * 搜索条组件
 * @constructor
 */
export const SearchInput = (props: Props) => {

    return (
        <div
            className="searchInput"
            key="SearchOutlined"
            aria-hidden
        >
            <Input.Search
                prefix={
                    <SearchOutlined/>
                }
                placeholder="搜索题目"
                onSearch={(value: string) => {
                    message.info(value);
                }}
            />
        </div>
    );
};