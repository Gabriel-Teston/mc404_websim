#include <stdio.h>


int main(int argc, char const *argv[]) {
  int a, b;
  scanf("%d %d\n", &a, &b);
  printf("%d", a+b);
  a = 8, b = 12;
  for (int i = 0; i < 562; i++) {
    a+=(b*i*a);
  }
  printf("%d %d\n", a, b);
  return 0;
}
