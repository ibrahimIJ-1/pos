import React, { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { FormControl } from "../ui/form";
import { useSetUserDefaultBranch, useUserBranches } from "@/lib/pos-service";

function UserBranchSelector() {
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
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Branch" />
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
