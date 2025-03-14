import React from "react";
import {TableView} from "react-native-tableview-simple";
import {StyleSheet} from "react-native";

interface CTableProps {
    children: React.ReactNode,
    props?: any
}

const CTable = ({props, children}: CTableProps) => {
    return (
        <TableView
            style={styles.table}
            {...props}
        >
            {children}
        </TableView>
    );
};

const styles = StyleSheet.create({
    table: {
        marginHorizontal: 15
    }
});

export default CTable;