class Util {

  private static _uniqueId = 0;

  /**
   * GenUniqueId
   */
  public static GenUniqueId() {
    return (this._uniqueId++).toString();
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
