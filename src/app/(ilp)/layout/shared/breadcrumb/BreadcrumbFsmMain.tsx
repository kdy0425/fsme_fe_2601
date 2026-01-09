import React from "react";
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import NextLink from "next/link";

interface BreadCrumbType {
  subtitle?: string;
  items?: any[];
  title: string;
  children?: JSX.Element;
  className?: string;
}

const Breadcrumb = ({ subtitle, items, title, children, className }: BreadCrumbType) => (
    <div className={`category-wrapper main-category-wrapper ${className}`}>
      <p>{title}</p>
      <Breadcrumbs
        separator={
          <div
            className="category-item-icon"
          />
        }
        sx={{ alignItems: "center", mt: items ? "10px" : "" }}
        aria-label="breadcrumb"
        className=""
      >
        {items
          ? items.map((item) => (
              <div key={item.title}>
                {item.to ? (
                  <NextLink href={item.to} passHref>
                    <Typography color="textSecondary">{item.title}</Typography>
                  </NextLink>
                ) : (
                  <Typography color="textPrimary">{item.title}</Typography>
                )}
              </div>
            ))
          : ""}
      </Breadcrumbs>
    </div>
);

export default Breadcrumb;
