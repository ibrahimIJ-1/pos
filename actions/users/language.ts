"use server"

import { prisma } from "@/lib/prisma";
import { checkUser } from "../Authorization";

export const setUserLanguage = async (lang: string) => {
  const user = await checkUser();
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      lang,
    },
  });
};

export const getUserLanguage = async () => {
  const user = await checkUser();
  const lang = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    select: {
      lang: true,
    },
  });
  if (lang) return lang?.lang;
  return "en";
};
