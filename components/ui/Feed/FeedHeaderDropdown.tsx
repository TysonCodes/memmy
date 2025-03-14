import React from "react";
import {Icon, Pressable, Text} from "native-base";
import {selectFeed, setDropdownVisible} from "../../../slices/feed/feedSlice";
import {useAppDispatch, useAppSelector} from "../../../store";
import {Ionicons} from "@expo/vector-icons";

interface HeaderDropdownProps {
    title: string,
    enabled: boolean
}

const FeedHeaderDropdown = ({title, enabled}: HeaderDropdownProps) => {
    const {dropdownVisible} = useAppSelector(selectFeed);

    const dispatch = useAppDispatch();

    const onPress = () => {
        if(!enabled) return;

        dispatch(setDropdownVisible());
    };

    return (
        <Pressable onPress={onPress}>
            <Text fontWeight={"bold"} fontSize={16}>
                {title}&nbsp;&nbsp;
                <Icon as={Ionicons} name={dropdownVisible ? "caret-up-outline" : "caret-down-outline"} color={"white"} />
            </Text>
        </Pressable>
    );
};

export default FeedHeaderDropdown;