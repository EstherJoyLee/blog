"use client";

import React, { useEffect, useState } from "react";
import emailjs from "@emailjs/browser";
import FormLayout from "@/components/FormLayout/FormLayout";
import Input from "@/components/FormLayout/Input/Input";
import { Button } from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/firebase/config";
import { useGetBlogNameFromUrl } from "@/utils/checkBlogNameFromUrl";

const ContactForm = () => {
  // const [isLoading, setIsLoading] = useState(false);
  const [blogOwnerEmail, setBlogOwnerEmail] = useState("");
  const blogUrl = useGetBlogNameFromUrl();
  const [formData, setFormData] = useState({
    from_name: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    const fetchOwnerEmail = async () => {
      try {
        const userCollection = collection(db, "users");
        const userQuery = query(
          userCollection,
          where("blogUrl", "==", blogUrl)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          setBlogOwnerEmail(userSnapshot.docs[0].data().email);
        }

        console.log("blogOwnerEmail: ", blogOwnerEmail);
      } catch (error) {
        if (error instanceof Error) {
          console.error(
            "블로그 주인 이메일을 가져오는 데 실패했습니다: ",
            error
          );
        }
      }
    };
    fetchOwnerEmail();
  }, [blogUrl]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // console.log("변경된 필드:", e.target.name, "새 값:", e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // setIsLoading(true);
    console.log("blogOwnerEmail: ", blogOwnerEmail);

    if (!blogOwnerEmail) {
      alert("블로그 주인의 이메일을 찾을 수 없습니다.");
      // setIsLoading(false);
      return;
    }

    const emailData = {
      to_name: blogUrl,
      ...formData,
    };

    // alert(JSON.stringify(process.env));

    emailjs
      .send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "", // EmailJS 대시보드에서 확인한 Service ID
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "", // EmailJs 대시보드에서 확인한 Template ID
        emailData,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "" // EmailJS 대시보드에서 확인한 Public Key
      )
      .then(
        (response) => {
          console.log("SUCCESS!", response.status, response.text);
          alert("이메일이 성공적으로 전송되었습니다.");
          setFormData({
            from_name: "",
            email: "",
            message: "",
          });
          // setIsLoading(false);
        },
        (error) => {
          console.log("FAILED...", error);
          alert("이메일 전송에 실패했습니다.");
          // setIsLoading(false);
        }
      );
  };

  return (
    <>
      <FormLayout title="Contact">
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="from_name"
            value={formData.from_name}
            onChange={handleChange}
            placeholder="Your name"
            isRequired
            label="이름"
          />
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Your email"
            isRequired
            label="Email"
          />
          <Input
            type="text"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="내용"
            label="이메일 내용"
          />
          <Button variant="contained" type="submit">
            전송
          </Button>
        </form>
      </FormLayout>
    </>
  );
};

export default ContactForm;
