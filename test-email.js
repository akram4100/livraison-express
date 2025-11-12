import emailjs from "@emailjs/nodejs";

await emailjs.send(
  "service_eupzdew",
  "template_o9owsdl",
  {
    to_email: "aarabic147@gmail.com",
    to_name: "Akram",
    verification_code: "123456",
  },
  {
    publicKey: "3M5sZiQlW-9GlSWAo",
    privateKey: "aIWUdISv0EO9fQhvyM3aP",
  }
);