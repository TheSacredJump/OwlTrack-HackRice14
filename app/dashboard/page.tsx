"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "../../components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconCalendar,
  IconMessage,
} from "@tabler/icons-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";
import CourseCalendar from "@/components/CourseCalendar";
import StudentCourses from "@/components/StudentCourses";
import GPTCareerAdvisor from "@/components/GPTCareerAdvisor";
import GPTCourseSuggester from "@/components/GPTCourseSuggester";

export default function Dashboard() {
  const { user } = useUser();
  const [currentView, setCurrentView] = useState("dashboard");

  const links = [
    {
      label: "Dashboard",
      id: "dashboard",
      icon: <IconBrandTabler className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Scheduler",
      id: "scheduler",
      icon: <IconCalendar className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Course Suggester and Chatbot",
      id: "chatbot",
      icon: <IconMessage className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Settings",
      id: "settings",
      icon: <IconSettings className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
    {
      label: "Logout",
      id: "logout",
      icon: <IconArrowLeft className="text-neutral-200 h-5 w-5 flex-shrink-0" />,
    },
  ];

  const [open, setOpen] = useState(false);

  const handleLinkClick = (id) => {
    setCurrentView(id);
  };

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <StudentCourses />;
      case "scheduler":
        return <CourseCalendar />;
      case "chatbot":
        return <GPTCourseSuggester />;
      case "settings":
        return <div className="p-4 bg-navy h-screen">Settings Component</div>;
      case "logout":
        // Handle logout logic here
        return null;
      default:
        return <Content />;
    }
  };

  return (
    <div className="rounded-md flex flex-col md:flex-row bg-neutral-800 w-full flex-1 mx-auto border border-neutral-700 overflow-hidden h-screen">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink 
                  key={idx} 
                  link={{...link, href: "#"}}  // Set href to "#" to prevent navigation
                  onClick={() => handleLinkClick(link.id)}
                />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: `${user?.firstName} ${user?.lastName}`,
                href: "#",
                icon: <UserButton />,
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}
export const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image src={"/owltrack_logo.png"} alt="logo" width={50} height={50} />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-white whitespace-pre"
      >
        OwlTrack
      </motion.span>
    </Link>
  );
};
export const LogoIcon = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <Image src={"/owltrack_logo.png"} alt="logo" width={30} height={30} />
    </Link>
  );
};

// Dummy dashboard component with content
const Content = () => {
  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-700 bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="flex gap-2">
          {[...new Array(4)].map((i) => (
            <div
              key={"first-array" + i}
              className="h-20 w-full rounded-lg  bg-neutral-800 animate-pulse"
            ></div>
          ))}
        </div>
        <div className="flex gap-2 flex-1">
          {[...new Array(2)].map((i) => (
            <div
              key={"second-array" + i}
              className="h-full w-full rounded-lg bg-neutral-800 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};
