import { useEffect, useState } from "react"
import { Holiday } from "../type";
import { working_service } from "../lib/working.service";

export function UseHoliday() {
    const [data, setData] = useState<Holiday[]>([]);
    const [initialLoading, setInitialLoading] = useState(true);

    async function reload(options?: { isInitial?: boolean }) {
        try {
            if (options?.isInitial) {
                setInitialLoading(true);
            }
            const res = await working_service.listHoliday();
            const auto_ided = res.map((item, index) => ({ ...item, no: index + 1 }));
            setData(auto_ided);

        } catch (err) {
            console.log(err);
        } finally {
            setInitialLoading(false);
        }
    }

    useEffect(() => {
        void reload({ isInitial: true });
    }, []);

    return { data, initialLoading, reload };
}