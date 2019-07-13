


int main(int argc, char const *argv[]) {
  volatile int a, b;
    // scanf("%d %d\n", &a, &b);
    // printf("%d", a+b);
  a = 8, b = 12;
  for (int i = 0; i < 562; i++) {
    a+=(b*i*a);
  }
  return 0;
}
