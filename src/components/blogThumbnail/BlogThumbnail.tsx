"use client";

import Image from "next/image";
import React from "react";

const BlogThumbnail = () => {
  return (
    <div className="relative w-80 h-52 rounded-lg overflow-hidden cursor-pointer group">
      <Image
        src="https://images.unsplash.com/photo-1738316849619-747a83d4e979?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMnx8fGVufDB8fHx8fA%3D%3D"
        alt="blog image"
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 group-hover:blur-md group-hover:brightness-75"
        width={100}
        height={100}
      />
      <div className="absolute bottom-4 left-4 text-white text-lg font-bold opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        JOYLOG
      </div>
    </div>
  );
};

export default BlogThumbnail;
