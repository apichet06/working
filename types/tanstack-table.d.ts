import "@tanstack/react-table"

// เปิดให้แต่ละ column กำหนด className เพิ่มให้ header/cell ของตัวเองได้ (เช่น sticky right-0 กันคอลัมน์เลื่อนหาย)
declare module "@tanstack/react-table" {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- ต้องประกาศ type param ให้ตรงกับ interface เดิมเป๊ะๆ ถึงจะ merge ได้ แม้ตัวมันเองจะไม่ได้ใช้ในนี้
    interface ColumnMeta<TData extends RowData, TValue> {
        thClassName?: string
        tdClassName?: string
    }
}
