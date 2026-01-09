import { useEffect, useState } from "react";

type Props = {
  description?: string;
  children: JSX.Element | JSX.Element[];
  title?: string;
};


const TestContainer = (props : Props) => {
  const [data, setData] = useState<any>(null);
  const [testValue, setTestValue] = useState<string>("Test01");

  // Default Life Cycle 
  useEffect(() => {
    setTestValue("Mounted Test Container");


    return setTestValue("UnMounted Test Container");
  }, [])

  return (
  <div>
    <title>{props.title}</title>
    <meta name="description" content={props.description} />
    <div>{testValue}</div>
    {props.children}
  </div>
  );
}

export default TestContainer;