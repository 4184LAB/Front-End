// 사이트 이름, 소개, 메뉴 구성은 이 파일에서 수정

export const site = {
  name: "크립토스 공화국 국방부",
  nameEn: "Ministry of National Defense, Cryptos Republic",
  slogan: "보이지 않는 전선까지 지키는 나라",
  notice: "이 누리집은 가상 국가 크립토스 공화국을 설정한 모의 사이트이며, 실제 정부 기관과 관련이 없습니다.",
  address: "크립토스 공화국 아르카나시 방위로 1 (가상 주소)",
  owner: "4184LAB",
  description: "사이버작전사령부에 복무한 경험을 통해 취약점 점검을 직접 수행하고, 취약한 환경조성과 조치방안을 직접 수행하는 홈페이지입니다.",
  email: "dcy0115@naver.com",
  links: [{ label: "GitHub", href: "https://github.com/David-Jo-4284" }],
};

// 메인 화면 슬라이드 문구입니다. 첫 번째 슬라이드는 위의 slogan과 description을 사용합니다.
export const slides = [
  {
    label: "국방부 소개",
    title: site.slogan,
    text: site.description,
    href: "/about",
    linkLabel: "국방부 소개",
  },
  {
    label: "사이버 방위",
    title: "사이버 영토를 지키는 도구",
    text: "인코딩, 해시 생성, 서버 상태 점검까지 브라우저에서 바로 확인합니다.",
    href: "/tools",
    linkLabel: "사이버 방위 도구",
  },
  {
    label: "정보공개",
    title: "투명하게 공개하는 국방 정보",
    text: "게시글과 댓글을 조건별로 검색하고 자료를 내려받을 수 있습니다.",
    href: "/search",
    linkLabel: "정보공개 검색",
  },
];

// 국방부 소개 페이지(/about) 문구입니다. 모두 가상 설정입니다.
export const about = {
  greeting: [
    "크립토스 공화국 국방부 누리집을 찾아주신 국민 여러분을 환영합니다.",
    "국방부는 영토와 영해, 영공은 물론 사이버 공간까지 국가의 주권이 미치는 모든 영역을 지키고 있습니다. 눈에 보이지 않는 위협일수록 먼저 찾아내고, 드러난 취약점은 투명하게 고쳐 나가겠습니다.",
    "국민의 신뢰가 가장 강한 방어선이라는 믿음으로, 늘 열린 자세로 소통하겠습니다.",
  ],
  missions: [
    {
      title: "국토 방위",
      text: "영토, 영해, 영공을 지키고 어떠한 위협에도 흔들리지 않는 방위 태세를 유지합니다.",
    },
    {
      title: "사이버 방위",
      text: "국가 정보망의 취약점을 먼저 점검하고, 침해 사고에 신속히 대응합니다.",
    },
    {
      title: "국민 소통",
      text: "국방 정보를 투명하게 공개하고 국민의 의견을 정책에 반영합니다.",
    },
  ],
  history: [
    { year: "2019", text: "크립토스 공화국 정부 수립과 함께 국방부 창설" },
    { year: "2021", text: "사이버방위국 신설" },
    { year: "2023", text: "국가 정보망 취약점 합동 점검 체계 구축" },
    { year: "2026", text: "국방부 누리집 개설" },
  ],
  organization: [
    { title: "기획조정실", text: "국방 정책과 예산을 총괄합니다." },
    { title: "방위정책국", text: "군사 전략과 대외 협력을 담당합니다." },
    { title: "사이버방위국", text: "취약점 점검과 침해 사고 대응을 담당합니다." },
    { title: "대변인실", text: "국방 소식 공개와 국민 소통을 담당합니다." },
  ],
};

export type Section = {
  href: string;
  title: string;
  description: string;
  nav: boolean;
};

export const sections: Section[] = [
  {
    href: "/about",
    title: "국방부 소개",
    description: "인사말과 임무, 연혁, 조직을 안내합니다.",
    nav: true,
  },
  {
    href: "/notices",
    title: "공지사항",
    description: "국방부 공지와 첨부 자료를 누구나 볼 수 있습니다.",
    nav: true,
  },
  {
    href: "/board",
    title: "국민참여 게시판",
    description: "로그인한 회원이 글과 첨부파일을 올리고 댓글로 이야기를 나눕니다.",
    nav: true,
  },
  {
    href: "/search",
    title: "정보공개 검색",
    description: "게시글, 댓글, 회원 데이터를 조건별로 검색하고 JSON으로 내려받습니다.",
    nav: true,
  },
  {
    href: "/external",
    title: "국방 자료실",
    description: "날씨, 환율, GitHub 저장소 등 외부 공개 API 데이터를 보여줍니다.",
    nav: true,
  },
  {
    href: "/tools",
    title: "사이버 방위 도구",
    description: "JSON 정리, 인코딩, 해시 생성 같은 개발 도구와 서버 상태를 확인합니다.",
    nav: true,
  },
  {
    href: "/mypage",
    title: "마이페이지",
    description: "내 정보와 비밀번호를 바꾸고 내가 쓴 글을 확인합니다.",
    nav: false,
  },
  {
    href: "/admin",
    title: "관리자",
    description: "회원 권한과 게시글을 관리하고 사이트 통계를 확인합니다.",
    nav: false,
  },
];
