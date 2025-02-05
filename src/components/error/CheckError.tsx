"use client";

import { checkBlogNameMatch } from "@/utils/checkBlogNameMatch";
import { useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";

interface IErrorProps {
  blogName: string;
}

const CheckError: React.FC<IErrorProps> = ({ blogName }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isNotError, setIsNotError] = useState<boolean | null>(null);
  useEffect(() => {
    if (typeof window === "undefined" || !blogName) return;
    const checkErrorPage = async () => {
      const result = await checkBlogNameMatch(blogName);
      setIsNotError(result);
      setLoading(false);
    };

    checkErrorPage();
  }, [isNotError, blogName, router]);

  useEffect(() => {
    if (loading || isNotError === null) return;

    if (!isNotError) {
      router.push("/error");
    }
  }, [loading, isNotError, router]);

  return null;
};

export default CheckError;
