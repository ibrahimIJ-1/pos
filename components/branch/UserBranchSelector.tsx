import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useSetUserDefaultBranch, useUserBranches } from "@/lib/branches-service";
import { useTranslations } from "next-intl";

function UserBranchSelector() {
  const t = useTranslations();
  const { data } = useUserBranches();
  const [value, setValue] = useState(data?.branchId ?? undefined);
  const branchChangerMutation = useSetUserDefaultBranch();
  useEffect(() => {
    if (data) setValue(data?.branchId ?? undefined);
  });
  const onValueChange = (id: string) => {
    setValue(id);
    branchChangerMutation.mutate(id);
  };
  return (
    <>
      <Select
        onValueChange={onValueChange}
        defaultValue={value}
        value={value}
        disabled={branchChangerMutation.isPending}
        dir={t("dir") as "rtl" | "ltr"}
      >
        <SelectTrigger>
          <SelectValue placeholder={t("Select Branch")} />
        </SelectTrigger>
        <SelectContent>
          {data?.branches?.map((branch) => (
            <SelectItem value={branch.id} key={branch.id}>
              {branch.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

export default UserBranchSelector;
