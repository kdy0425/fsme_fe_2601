type propsTypes = {
  headClass?: string;
  title: string;
  subTitle?: string;
};

const PageTitle = ({ headClass, title, subTitle }: propsTypes) => {
  return (
    <div className={headClass}>
      <div className="title-group">
        <h1>{title}</h1>
        <h2>{subTitle}</h2>
      </div>
    </div>
  );
};

export default PageTitle;