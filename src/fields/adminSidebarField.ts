import { Field } from "payload/types";
import { AdminSidebar } from "../components/visualEditor";

export const createAdminSidebarField = (): Field => {
    return {
        name: "adminsidebar",
        type: "ui",
        admin: {
            components: {
                Field: AdminSidebar,
            },
        },
    };
};
