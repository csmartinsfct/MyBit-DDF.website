import styled from 'styled-components'

const StyledButtonChallenge = styled.div`
  position: relative;
  margin-top: 25px;
  .ant-btn {
    font-size: 18px;
    font-weight: 500;
    width: 100%;
  }

  @media (min-width: 768px) {
    margin-top: 0px;

    .ant-btn {
      width: auto;
    }
  }
`;

export default StyledButtonChallenge;
