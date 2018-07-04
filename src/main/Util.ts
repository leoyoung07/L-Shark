class Util {
  /**
   * GenUniqueId
   */
  public static GenUniqueId() {
    return new Date().getTime().toString() + Util.Rand(1000, 9999).toString();
  }

  /**
   * Rand
   */
  public static Rand(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }
}

export default Util;
